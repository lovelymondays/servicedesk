// src/pages/TaskView.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  UserCircle,
  Key,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  Clock,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";

const TaskView = () => {
  const { category } = useParams();
  const { user, token, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Open");

  // Category display info
  const categoryInfo = {
    "user-guidance": {
      name: "User Guidance",
      icon: <UserCircle className="text-blue-500" size={24} />,
      color: "text-blue-500",
    },
    "password-reset": {
      name: "Application Password Reset",
      icon: <Key className="text-green-500" size={24} />,
      color: "text-green-500",
    },
    "incident-solving": {
      name: "Application Incident Solving",
      icon: <AlertTriangle className="text-red-500" size={24} />,
      color: "text-red-500",
    },
    "request-solving": {
      name: "Application Service Request Solving",
      icon: <ClipboardList className="text-purple-500" size={24} />,
      color: "text-purple-500",
    },
    faq: {
      name: "FAQ",
      icon: <MessageSquare className="text-yellow-500" size={24} />,
      color: "text-yellow-500",
    },
    "sla-monitoring": {
      name: "SLA Monitoring",
      icon: <Clock className="text-indigo-500" size={24} />,
      color: "text-indigo-500",
    },
  };

  // Fetch tasks when component mounts or category changes
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (token && category) {
      fetchTasks();
    }
  }, [token, category, user, loading]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/dashboard?category=${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch tasks");
      }
    } catch (error) {
      setError("Network error: Could not fetch tasks");
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          category,
          status,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setTitle("");
        setContent("");
        setStatus("Open");
        fetchTasks();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create task");
      }
    } catch (error) {
      setError("Network error: Could not create task");
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8080/api/tasks/${currentTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            status,
          }),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setTitle("");
        setContent("");
        setStatus("Open");
        setCurrentTask(null);
        fetchTasks();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update task");
      }
    } catch (error) {
      setError("Network error: Could not update task");
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/dashboard/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchTasks();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete task");
      }
    } catch (error) {
      setError("Network error: Could not delete task");
      console.error("Error deleting task:", error);
    }
  };

  const openEditModal = (task) => {
    setCurrentTask(task);
    setTitle(task.title);
    setContent(task.content);
    setStatus(task.status);
    setShowEditModal(true);
  };

  // If still loading or no user, show loading spinner
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar (simplified from Dashboard) */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold text-blue-600">SupportDesk</h1>
          </Link>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Categories
            </h2>
            <div className="mt-2 space-y-1">
              {Object.entries(categoryInfo).map(([id, info]) => (
                <Link
                  key={id}
                  to={`/tasks/${id}`}
                  className={`block px-4 py-2 text-sm rounded ${
                    id === category
                      ? "bg-gray-100 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    {info.icon}
                    <span className="ml-2">{info.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {categoryInfo[category]?.icon}
              <h2 className="ml-2 text-lg font-medium text-gray-900">
                {categoryInfo[category]?.name || "Tasks"}
              </h2>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Task
              </button>
            </div>
          </div>
        </header>

        {/* Task List */}
        <main className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No tasks found for this category.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-gray-600">{task.content}</div>

                    <div className="mt-4 flex justify-between items-center text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          task.status === "Open"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status}
                      </span>

                      <span className="text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Add New Task</h3>

            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="content"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  id="status"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Edit Task</h3>

            <form onSubmit={handleEditTask}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-title"
                >
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-content"
                >
                  Content
                </label>
                <textarea
                  id="edit-content"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-status"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentTask(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskView;
