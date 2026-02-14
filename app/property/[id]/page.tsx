interface Props {
  params: { id: string };
}
export default function PropertyPage({ params }: Props) {
  return (
    <main className="flex items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-semibold">Property id: {params.id}</h1>
    </main>
  );
}
