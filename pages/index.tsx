import Head from "next/head";

const siteTitle="Music Label Tracker"

export default function Home() {
  return (
    <div className="h-full">
      <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-full flex flex-col items-center space-y-20 text-sans bg-gray-100">
        <p className="mt-36 p-4 text-7xl bg-blue-500">{siteTitle}</p>
        <input type="text" className="w-1/2 h-12 p-4 shadow-md" ></input>
      </main>
    </div>
  );
}
