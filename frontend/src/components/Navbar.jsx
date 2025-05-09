import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow ">
      <div className="w-full px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between w-auto h-16">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">SupportDesk</h1>
            </div>
          </div>

          <div className="flex items-center">
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex items-center text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon
                  className="w-8 h-8 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <div>{user?.email}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full px-4 py-2 text-left text-sm text-gray-700"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
