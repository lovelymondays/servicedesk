import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaTimes, FaPlus } from "react-icons/fa";
import ListCard from "./ListCard";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authStore";
import CreateTaskModal from "./modals/CreateTaskModal";
import CreateCategoryModal from "./modals/CreateCategoryModal";

export default function CategoryContent() {
  const { categoryId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("date");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const { tasks, loading, error, getTasks, categories } = useTaskStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    getTasks(categoryId);
  }, [categoryId, getTasks]);

  const category = categories.find((cat) => cat.id === categoryId);
  if (!category) {
    return <div>Category not found</div>;
  }

  const filteredItems = tasks.filter(
    (item) =>
      (filterStatus === "all" || item.status === filterStatus) &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full py-8">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-auto h-auto text-black">
      <div className="container w-full px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{category.title}</h1>
            <p className="mt-1 text-gray-600">
              {filteredItems.length} items •{" "}
              {tasks.filter((t) => t.status === "pending").length} pending
              approval
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateTask(true)}
              className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <FaPlus className="mr-2" />
              Create Task
            </button>
          </div>
        </div>

        <div className="w-full mb-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search in this category"
              className="w-full p-3 pl-10 pr-10 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="w-full p-4 mb-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center w-full space-x-4">
              <div className="flex items-center">
                <span className="mr-2">Results per page</span>
                <select
                  value={resultsPerPage}
                  onChange={(e) => setResultsPerPage(Number(e.target.value))}
                  className="px-4 py-2 text-sm text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-1 text-sm border rounded-md bpx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Status</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-1 text-sm border rounded-md bpx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          {sortedItems.slice(0, resultsPerPage).map((item) => (
            <ListCard key={item.id} item={item} isAdmin={isAdmin} />
          ))}
        </div>
      </div>

      {showCreateTask && (
        <CreateTaskModal
          categoryId={categoryId}
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            getTasks(categoryId);
          }}
        />
      )}

      {showCreateCategory && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategory(false)}
          onSuccess={() => {
            setShowCreateCategory(false);
            getTasks(categoryId);
          }}
        />
      )}
    </div>
  );
}
