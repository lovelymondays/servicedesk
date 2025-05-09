import { useState, useEffect } from "react";
import { useTaskStore } from "../../store/taskStore";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";

export default function CreateTaskModal({ categoryId, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "Q&A",
    category: categoryId,
    status: "pending",
    keywords: [],
    user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [user]);

  const [keywordInput, setKeywordInput] = useState("");
  const { createTask, loading, error } = useTaskStore();

  const generateDynamicContent = (type, title) => {
    const currentDate = new Date().toLocaleDateString();
    const templates = {
      "Q&A": `# ${title}\n\nLast Updated: ${currentDate}\n\n## Question\n[Question details will be added here]\n\n## Answer\n[Detailed answer will be provided here]\n\n## Additional Resources\n- [Add relevant links]\n- [Add documentation references]`,
      Issue: `# ${title}\n\nReported on: ${currentDate}\n\n## Issue Description\n[Detailed issue description]\n\n## Steps to Reproduce\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\n## Expected Behavior\n[What should happen]\n\n## Current Behavior\n[What is happening]\n\n## Possible Solution\n[If you have any suggestions]`,
    };
    return templates[type] || templates["Q&A"];
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      content: generateDynamicContent(newType, prev.title),
    }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      content: generateDynamicContent(prev.type, newTitle),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error("Please log in to create a task");
      return;
    }

    const taskData = {
      ...formData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    try {
      const success = await createTask(categoryId, taskData);
      if (success) {
        toast.success("Task created successfully");
        onSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create task");
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
          <h2 className="mb-4 text-2xl font-bold">Create New Task</h2>
          {!user ? (
            <div className="mb-4 text-red-600">
              Please log in to create tasks
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
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
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={handleTypeChange}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Q&A">Q&A</option>
                    <option value="Issue">Issue</option>
                  </select>
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
                    rows={12}
                    className="block w-full mt-1 font-mono text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
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
                      type="button"
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
                    {loading ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
