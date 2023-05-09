import { useRouter } from "next/router";
import {
  Fragment,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import WeekCalendar from "~/components/calendar/WeekCalendar";
import { api } from "~/utils/api";
import { useSearchParams } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const oauthMutation = api.calendar.generateAuthUrl.useMutation({
    onSuccess(url) {
      location.assign(url);
    },
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const importing = searchParams.get("import");
  const isImporting = importing === "true";
  const closeModal = () =>
    router.push({ pathname: router.pathname, query: { import: false } });
  const openModal = () =>
    router.push({ pathname: router.pathname, query: { import: true } });

  const accessTokenRef = useRef<string>();
  // Get token and scope from cookies if exist
  accessTokenRef.current = document.cookie
    .split("; ")
    .find((ele) => ele.startsWith("googleOAuthAccessToken"))
    ?.split("=")?.[1];
  return (
    <>
      {accessTokenRef.current ? (
        <button
          onClick={() => {
            openModal();
          }}
        >
          Import Calendar
        </button>
      ) : (
        <button
          onClick={() => {
            oauthMutation.mutate();
          }}
        >
          Import calendar
        </button>
      )}
      <ImportModal
        accessTokenRef={accessTokenRef}
        isImporting={isImporting}
        closeModal={closeModal}
      />
      <WeekCalendar />
    </>
  );
}

function ImportModal({
  accessTokenRef,
  isImporting,
  closeModal,
}: {
  accessTokenRef: MutableRefObject<string | undefined>;
  isImporting: boolean;
  closeModal: () => void;
}) {
  /*useQuery({
    queryKey: ["calendars"],
    queryFn: () => {
      return calendar({ version: "v3", auth: accessTokenRef.current }).calendarList;
    },
  });*/
  return (
    <Transition.Root show={isImporting} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Deactivate account
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to deactivate your account? All of
                        your data will be permanently removed from our servers
                        forever. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={closeModal}
                  >
                    Deactivate
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
