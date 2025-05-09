import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";

export default function CreateCategoryModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
  });
  const { addCategory, loading, error } = useTaskStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await addCategory({
      ...formData,
      id: formData.id.toLowerCase().replace(/\s+/g, "-"),
    });
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Category</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., user-guide"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  This will be used in the URL. Use lowercase letters, numbers,
                  and hyphens only.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., User Guide"
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
