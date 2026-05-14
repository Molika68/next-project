import Link from "next/link";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Book</h1>
        <Link
          href="/book/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create
        </Link>
      </div>
      {children}
    </div>
  );
}
