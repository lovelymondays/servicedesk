import { useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";

const categories = [
  { name: "User Guidance", href: "/dashboard/user-guidance" },
  { name: "Password Reset", href: "/dashboard/password-reset" },
  { name: "Incident Solving", href: "/dashboard/incident-solving" },
  { name: "Request Solving", href: "/dashboard/request-solving" },
  { name: "FAQ", href: "/dashboard/faq" },
  { name: "SLA Monitoring", href: "/dashboard/sla-monitoring" },
];

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-64 min-h-dvh">
      <div className="flex flex-col flex-1 h-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col flex-grow mt-5">
            <nav className="flex-1 px-2 space-y-1" aria-label="Sidebar">
              {filteredCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md group hover:bg-gray-50 hover:text-gray-900"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
