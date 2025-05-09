import { useState } from "react";
import { FaEdit, FaTrash, FaStar, FaCheck, FaTimes } from "react-icons/fa";
import {
  BsFillQuestionCircleFill,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { useTaskStore } from "../store/taskStore";
import { useParams } from "react-router-dom";
import EditTaskModal from "./modals/EditTaskModal";

export default function ListCard({ item, isAdmin }) {
  const { categoryId } = useParams();
  const { deleteTask, approveTask, rejectTask, rateTask } = useTaskStore();
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteTask(categoryId, item.id);
    }
  };

  const handleApprove = async () => {
    await approveTask(categoryId, item.id);
  };

  const handleReject = async () => {
    if (rejectReason.trim()) {
      await rejectTask(categoryId, item.id, rejectReason);
      setShowRejectReason(false);
      setRejectReason("");
    }
  };

  const handleRate = async (rating) => {
    await rateTask(categoryId, item.id, rating);
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRate(rating)}
            className={`text-lg ${
              rating <= item.rating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-500 transition-colors`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  const getStatusColor = () => {
    switch (item.status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
            >
              {item.status}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Type: {item.type}</span>
            <span>•</span>
            <div className="flex items-center space-x-2">
              <span>Rating:</span>
              {renderStars()}
            </div>
            <span>•</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <div className="mt-2">
            {item.keywords?.map((keyword, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-600 mr-2 mb-2"
              >
                {keyword}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowContent(!showContent)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            {showContent ? "Hide Content" : "Show Content"}
          </button>
          {showContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {item.content}
              </pre>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          {isAdmin && item.status === "pending" && (
            <>
              <button
                onClick={handleApprove}
                className="p-2 text-green-500 hover:text-green-600"
                title="Approve"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => setShowRejectReason(true)}
                className="p-2 text-red-500 hover:text-red-600"
                title="Reject"
              >
                <FaTimes />
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-blue-500 hover:text-blue-600"
                title="Edit"
              >
                <FaEdit />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-600"
                title="Delete"
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>

      {showRejectReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Please provide a reason for rejection..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setShowRejectReason(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditTaskModal
          task={item}
          categoryId={categoryId}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
