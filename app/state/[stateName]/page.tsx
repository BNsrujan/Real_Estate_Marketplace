interface Props {
  params: { stateName: string };
}
export default function StatePage({ params }: Props) {
  return (
    <main className="flex items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-semibold">State: {params.stateName}</h1>
    </main>
  );
}
