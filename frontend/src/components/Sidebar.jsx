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
    <div className="flex w-64 flex-col min-h-dvh">
      <div className="flex h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
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

          <div className="mt-5 flex flex-grow flex-col">
            <nav className="flex-1 space-y-1 px-2" aria-label="Sidebar">
              {filteredCategories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <button
            type="button"
            className="group block w-full rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-500"
          >
            <div className="flex items-center justify-center">
              <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              New Task
            </div>
          </button>
        </div> */}
      </div>
    </div>
  );
}
