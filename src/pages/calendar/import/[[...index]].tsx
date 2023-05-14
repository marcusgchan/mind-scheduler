import { getAuth } from "@clerk/nextjs/server";
import { auth, calendar, calendar_v3 } from "@googleapis/calendar";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { env } from "~/env.mjs";

type Output = {
  calendars: calendar_v3.Schema$CalendarList["items"] | undefined | null;
};

export const getServerSideProps: GetServerSideProps<Output> = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { props: { calendars: null } };
  const googleOAuthToken = ctx.req.cookies["googleOAuthAccessToken"];
  if (!googleOAuthToken) {
    return { redirect: { destination: "/calendar", permanent: false } };
  }

  try {
    const oAuth2Client = new auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URL
    );
    oAuth2Client.setCredentials({ access_token: googleOAuthToken });

    const res = await calendar({
      version: "v3",
      auth: oAuth2Client,
    }).calendarList.list();
    const calendars = res.data.items;

    return { props: { calendars } };
  } catch (e) {
    console.error(e);
  }

  return { redirect: { destination: "/calendar", permanent: false } };
};

export default function Index(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(
    new Set()
  );

  const [checkedAll, setCheckedAll] = useState(false);
  const handleCheckedAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelectedCalendars = new Set(
        props.calendars?.map((calendar) => calendar.id as string)
      );
      setSelectedCalendars(newSelectedCalendars);
      setCheckedAll(true);
    } else {
      setSelectedCalendars(new Set());
      setCheckedAll(false);
    }
  };

  const handleChecked = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      selectedCalendars.add(id);
      setSelectedCalendars(new Set(selectedCalendars));
    } else {
      selectedCalendars.delete(id);
      setSelectedCalendars(new Set(selectedCalendars));
      setCheckedAll(false);
    }
  };
  
  const handleImport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  if (!props.calendars) return <div>No calendars to import</div>;

  return (
    <form onSubmit={handleImport}>
      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
        <div className="flex items-center justify-between py-4">
          <legend className="text-base font-semibold leading-6 text-gray-900">
            Import calendars
          </legend>
          <div className="flex flex-col items-end gap-2">
            <label
              htmlFor="select-all"
              className="select-none whitespace-nowrap font-medium text-gray-900"
            >
              Select all
            </label>
            <input
              id="select-all"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              type="checkbox"
              checked={checkedAll}
              onChange={handleCheckedAll}
            />
          </div>
        </div>
        {props.calendars.map((calendar, personIdx) => (
          <div key={personIdx} className="relative flex items-start py-4">
            <div className="min-w-0 flex-1 text-sm leading-6">
              <label
                htmlFor={`${calendar.id}`}
                className="select-none font-medium text-gray-900"
              >
                {calendar.summary}
              </label>
            </div>
            <div className="ml-3 flex h-6 items-center">
              <input
                id={`${calendar.id}`}
                name={`${calendar.id}`}
                checked={selectedCalendars.has(calendar.id as string)}
                onChange={(e) => handleChecked(calendar.id as string, e)}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Import
      </button>
    </form>
  );
}
