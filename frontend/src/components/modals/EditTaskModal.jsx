import { useState, useEffect } from "react";
import { useTaskStore } from "../../store/taskStore";

export default function EditTaskModal({
  task,
  categoryId,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "Q&A",
    category: "",
    status: "pending",
    keywords: [],
  });
  const [keywordInput, setKeywordInput] = useState("");
  const { updateTask, loading, error } = useTaskStore();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        content: task.content || "",
        type: task.type || "Q&A",
        category: categoryId,
        status: task.status || "pending",
        keywords: task.keywords || [],
      });
    }
  }, [task, categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateTask(categoryId, task.id, {
      ...formData,
      category: categoryId,
    });
    if (success) {
      onSuccess();
    }
  };

  const handleKeywordAdd = (e) => {
    e.preventDefault();
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleKeywordRemove = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Edit Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Q&A">Q&A</option>
                  <option value="Issue">Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <div className="flex mt-1">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="block w-full border-gray-300 shadow-sm rounded-l-md focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add keyword"
                  />
                  <button
                    onClick={handleKeywordAdd}
                    className="px-4 py-2 text-white bg-blue-500 rounded-r-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
