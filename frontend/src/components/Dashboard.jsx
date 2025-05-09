// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import {
  UserGroupIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const categories = [
  {
    name: "User Guidance",
    href: "/dashboard/user-guidance",
    icon: UserGroupIcon,
    description: "Help users navigate and use the application effectively",
  },
  {
    name: "Password Reset",
    href: "/dashboard/password-reset",
    icon: KeyIcon,
    description: "Handle user password reset requests and issues",
  },
  {
    name: "Incident Solving",
    href: "/dashboard/incident-solving",
    icon: ExclamationTriangleIcon,
    description: "Track and resolve reported incidents and bugs",
  },
  {
    name: "Request Solving",
    href: "/dashboard/request-solving",
    icon: ClipboardDocumentCheckIcon,
    description: "Manage and process user service requests",
  },
  {
    name: "FAQ",
    href: "/dashboard/faq",
    icon: QuestionMarkCircleIcon,
    description: "Common questions and answers for quick reference",
  },
  {
    name: "SLA Monitoring",
    href: "/dashboard/sla-monitoring",
    icon: ClockIcon,
    description: "Monitor and maintain service level agreements",
  },
];

export default function Dashboard() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 w-full">
        <h2 className="text-2xl font-semibold leading-6 text-gray-900">
          Knowledge Base
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Select a category to view support documentation and guides
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-primary-400 hover:ring-1 hover:ring-primary-400 w-full"
            >
              <div className="flex-shrink-0">
                <category.icon
                  className="h-6 w-6 text-gray-400 group-hover:text-primary-600"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
